import React, { useEffect, useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLoaderData } from 'react-router-dom';
import { useSocket } from '../components/SocketProvider';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import UserBar from '../components/UserBar';
import { useOutletContext } from 'react-router-dom';
import customFetch from '../../utils/customFetch.js';


export const loader = async ({ params }) => {
  try {
    const { id } = params;
    const { data } = await customFetch.get(`/users/single-user/${id}`, {
      withCredentials: true
    });
    return data;
  }
  catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.msg);
    return redirect('/');
  }
};

const ChatArea = () => {
  const user = useLoaderData();
  const { socket } = useSocket();
  const [msgFormData, setMsgFormData] = useState({ message: '' });
  const [msg, setMsg] = useState([]);
  const [status, setStatus] = useState();
  const typingIdRef = useRef();
  const toggleSidebar = useOutletContext();

  // toggleSidebar is not used anywhere below and the logic for unread messages when sidebar is active is yet to be implemented

  useEffect(() => {
    socket.on('typing-ongoing', async (socketId) => {
      const userId = await customFetch.post(`/users/get-user-id`, { id: socketId }, {
        withCredentials: true
      });
      if (user._id === userId.data) {
        setStatus('Typing...');
      }
    })

    socket.on('typing-stopped', async (socketId) => {
      const userId = await customFetch.post(`/users/get-user-id`, { id: socketId }, {
        withCredentials: true
      });
      if (user._id === userId.data) {
        const response = await customFetch.post('/users/get-user-status', { id: user._id }, {
          withCredentials: true
        })
        if (response.data) {
          setStatus('Online')
        } else {
          setStatus('Offline')
        }
      }
    })
    socket.on('receive-message', async (msg, msgId, socketId) => {
      const userId = await customFetch.post(`/users/get-user-id`, { id: socketId }, {
        withCredentials: true
      });
      if (user._id === userId.data) {
        setMsg(prevData => {
          console.log('receive message')
          console.log(toggleSidebar)
          socket.emit('message-read', msgId, userId.data);
          return [...prevData, { text: msg, sender: false, msgId: msgId }]; // Received message
        });
      }
    });

    socket.on('delete-messages', (senderId) => {
      if (user._id === senderId) {
        setMsg([])
      }
    })

    socket.on('message-read-update', () => {
      setMsg(prevData => {
        return prevData.map(oldMsg => {
          return { ...oldMsg, read: true }
        })
      })
    })
    return () => {
      socket.off('receive-message');
      socket.off('typing-stopped');
      socket.off('typing-ongoing');
      socket.off('message-read-update');
      socket.off('delete-messages');
    };
  }, [user, toggleSidebar]);

  useEffect(() => {
    const handleUserStatusChanged = (data) => {
      const { userId, isOnline } = data;
      if (user._id === userId) {
        if (isOnline)
          setStatus('Online');
        else {
          setStatus('Offline')
        }
      }
    };

    socket.on('user-status-changed', handleUserStatusChanged);

    return () => {
      socket.off('user-status-changed', handleUserStatusChanged);
    };
  }, [user._id, socket]);

  const getMessages = async () => {
    const senderId = localStorage.getItem('userId');
    const receiverId = user._id;
    const { data } = await customFetch.post('/messages/get-messages', { senderId, receiverId }, {
      withCredentials: true
    })
    data.map((msg) => {
      if (msg.sender === senderId) {
        setMsg(prevData => {
          return [...prevData, { text: msg.message, sender: true, read: msg.read, msgId: msg._id }];
        });
      } else {
        setMsg(prevData => {
          if (msg.read === false) {
            socket.emit('message-read', msg._id, user._id);
          }
          return [...prevData, { text: msg.message, sender: false, read: msg.read, msgId: msg._id }];
        });
      }
    })
  }

  const onClearChat = async () => {
    const senderId = localStorage.getItem('userId');
    const receiverId = user._id;
    socket.emit('delete-messages', receiverId, senderId)
    setMsg([])
  }

  useEffect(() => {
    getMessages();
  }, [user._id])

  useEffect(() => {
    const getStatus = async () => {
      const response = await customFetch.post('/users/get-user-status', { id: user._id }, {
        withCredentials: true
      })
      if (response.data) {
        setStatus('Online')
      } else {
        setStatus('Offline')
      }
    }

    getStatus();
  }, [user])

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    socket.emit('login', userId);
  }, []);

  useEffect(() => {
    // Clear messages when user changes
    setMsg([]);
  }, [user._id]);

  function updateMsgForm(e) {
    socket.emit('typing-started', user._id);

    if (typingIdRef.current) {
      clearTimeout(typingIdRef.current)
      typingIdRef.current = null;
    }

    typingIdRef.current = setTimeout(() => {
      socket.emit('typing-stopped', user._id);
    }, 1300)

    setMsgFormData(prevData => {
      return { ...prevData, [e.target.name]: e.target.value };
    });
  }

  function sendMsg(e) {
    e.preventDefault();
    if (msgFormData.message === '') return;
    setMsg(prevData => {
      return [...prevData, { text: msgFormData.message, sender: true }]; // Sent message
    });
    socket.emit('send-message', msgFormData.message, user._id);
    socket.emit('message-sent', user._id);
    setMsgFormData({ message: '' });
  }

  return (
    <Container className="d-flex flex-column vh-100 p-0 col-12">
      {/* Top Bar with User Info */}
      <UserBar user={user} status={status} onClearChat={onClearChat} />
      {/* Chat Content Area */}
      <Row className="flex-grow-1 overflow-auto m-0" style={{ backgroundColor: '#f1f1f1' }}>
        <Col className="d-flex flex-column justify-content-end">
          <Message msg={msg} />
        </Col>
      </Row>

      {/* Bottom Input Bar */}
      <Row className="border-top py-2 px-3 bg-light m-0">
        <Col>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Type a message"
              aria-label="Type a message"
              style={{ borderRadius: '25px', marginRight: '10px' }}
              onChange={(e) => updateMsgForm(e)}
              name="message"
              value={msgFormData.message}
            />
            <Button variant="primary" style={{ borderRadius: '25px' }} onClick={(e) => sendMsg(e)}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatArea;
