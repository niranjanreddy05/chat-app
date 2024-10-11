import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLoaderData } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../components/SocketProvider';


export const loader = async ({ params }) => {
  try {
    const { id } = params;
    const { data } = await axios.get(`http://localhost:5100/api/users/single-user/${id}`, {
      withCredentials: true
    })
    return data
  }
  catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.msg)
    return redirect('/login');
  }
}

const ChatArea = () => {
  const user = useLoaderData();
  const { socket } = useSocket();
  const [msgFormData, setMsgFormData] = useState({ message: '' });
  useEffect(() => {
    socket.on('receive-message', async (msg, socketId) => {
      const userId = await axios.post(`http://localhost:5100/api/users/get-user-id`, { id: socketId }, {
        withCredentials: true
      });
      if (user._id === userId.data) {
        setMsg(prevData => {
          return [...prevData, msg]
        })
      }
    })
    return () => {
      socket.off('receive-message')
    }
  },[user]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    socket.emit('login', userId);
  }, []);

  useEffect(() => {
    // Clear messages when user changes
    setMsg([]);
  }, [user._id]);

  const [msg, setMsg] = useState([]);

  function updateMsgForm(e) {
    setMsgFormData(prevData => {
      return { ...prevData, [e.target.name]: e.target.value }
    })
  }

  function sendMsg(e) {
    e.preventDefault();
    if (msgFormData.message === '') return;
    setMsg(prevData => {
      return [...prevData, msgFormData.message]
    })
    console.log(user._id);
    socket.emit('send-message', msgFormData.message, user._id);
    setMsgFormData({ message: '' });
  }

  return (
    <Container fluid className="d-flex flex-column vh-100 p-0">
      {/* Top Bar with User Info */}
      <Row className="bg-light border-bottom py-2 px-3 m-0">
        <Col>
          <h4 className="mb-0">{user?.username || "User"}</h4>
        </Col>
      </Row>

      {/* Chat Content Area */}
      <Row className="flex-grow-1 overflow-auto m-0" style={{ backgroundColor: '#f1f1f1' }}>
        <Col className="d-flex flex-column justify-content-end">

          <div className="text-center text-muted">
            {msg.length === 0 ?
              <p>No messages yet...</p>
              :
              msg.map((m, i) => {
                return <div key={i}>{m}</div>
              })
            }
          </div>
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
