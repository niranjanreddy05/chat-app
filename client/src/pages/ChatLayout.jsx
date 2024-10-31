import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Outlet, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes } from '@fortawesome/free-solid-svg-icons';
import User from '../components/User';
import customFetch from '../../utils/customFetch.js';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useSocket } from '../components/SocketProvider';


const ChatLayout = () => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { socket, isConnected } = useSocket();
  const [userData, setUserData] = useState([]);
  const [username, setUsername] = useState(''); // Add state for username
  const [chatCount, setChatCount] = useState(0);
  const [searchData, setSearchData] = useState({ search: '' });
  const navigate = useNavigate();


  const updateSideBar = () => {
    setToggleSidebar(prevData => !prevData);
  }


  const fetchUsers = async () => {
    try {
      const { data } = await customFetch.get('/users/all-users', {
        withCredentials: true
      });
      const receiverId = localStorage.getItem('userId');
      

      const updatedUserData = await Promise.all(data.map(async (user) => {
        const { data: count } = await customFetch.post(
          '/messages/get-unread-count',
          { senderId: user._id, receiverId },
          { withCredentials: true }
        );
        return { ...user, count };
      }));
      setUserData(updatedUserData);
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };

  useEffect(() => {
    setChatCount(0);
    userData.forEach(user => {
      if (user.count !== 0) {
        setChatCount(count => count + 1);
      }
    })
  }, [userData])

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const { data } = await customFetch.get(`/users/single-user/${userId}`);
      const { username } = data;
      setUsername(username)
    } catch (error) {
      console.log(error);
      toast.error('Error fetching logged in user details');
      navigate('/');
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);


  useEffect(() => {
    if (isConnected) {
      const userId = localStorage.getItem('userId');
      socket.emit('login', userId);
    }
  }, [socket, isConnected])

  useEffect(() => {
    fetchProfile();
  }, [])

  useEffect(() => {
    const handleMessageReceived = () => {
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    };
    if (socket && isConnected) {
      socket.on('message-received', handleMessageReceived);
      socket.on('delete-messages', handleMessageReceived);
      return () => {
        socket.off('message-received', handleMessageReceived);
        socket.off('delete-messages', handleMessageReceived);
      };
    }
  }, [socket, isConnected]);

  const setCountToZero = (senderId) => {
    setUserData((prevData) => {
      return prevData.map((user) => {
        if (user._id === senderId) {
          return { ...user, count: 0 };
        }
        return user;
      });
    });
  };

  useEffect(() => {
    const updateUsers = () => {
      fetchUsers();
    }
    if (isConnected) {
      socket.on('user-status-changed', updateUsers)
    }

    return () => {
      if (isConnected) {
        socket.off('user-status-changed', updateUsers)
      }
    }
  }, [socket, isConnected])

  const logout = async () => {
    try {
      await customFetch.get('/auth/logout');
      if (socket) {
        socket.disconnect();
      }
      navigate('/', { state: { key: 'ieajoiha' } });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging you out')
    }
  }

  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    setFilteredUsers(userData);
  }, [userData, setUserData]);


  const updateSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchData(prevData => ({ ...prevData, search: e.target.value }));

    const matched = userData.filter(user =>
      user.username.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(matched);
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 m-0">
        <Col className='col-1 d-block d-sm-none bg-light'>
          <div style={{ height: '100vh' }}>
            <button
              onClick={() => {
                updateSideBar();
                navigate('/chat');
              }}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon
                icon={faCommentDots}
                style={{
                  marginTop: '10px',
                  fontSize: '20px',
                  color: '#000',
                  marginLeft: '0px'
                }}
              />

              {chatCount > 0 &&
                <p style={{
                  position: 'absolute',
                  top: '5px',
                  right: '-5px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 5px',
                  fontSize: '12px',
                  lineHeight: '1',
                }}>
                  {chatCount}
                </p>
              }

            </button>
          </div>
        </Col>
        {toggleSidebar &&
          <Col className="vh-100 bg-light p-3 d-flex flex-column justify-content-between d-block d-sm-none w-100">
            <div
              className="position-absolute"
              style={{
                top: '10px',
                right: '10px',
                cursor: 'pointer',
              }}
              onClick={updateSideBar}
            >

              <FontAwesomeIcon icon={faTimes} style={{ fontSize: '24px' }} />
            </div>
            <div style={{
              overflowY: 'scroll',
            }}>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search for a user"
                  aria-label="Search for a user"
                  style={{ borderRadius: '25px' }}
                  value={searchData.search}
                  onChange={(e) => updateSearch(e)}
                />
                <InputGroup.Text
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '0 25px 25px 0',
                  }}
                >
                </InputGroup.Text>
              </InputGroup>
              <ul className="list-unstyled">
                {filteredUsers.map((user) => (
                  <User key={user._id} data={user} count={user.count} setCountToZero={setCountToZero} updateSideBar={updateSideBar} />
                ))}
              </ul>
            </div>

            {/* Logged-in user info and logout button */}
            <div className="d-flex justify-content-between align-items-center p-2 border-top">
              <span className="fw-bold">{username}</span>
              <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
            </div>
          </Col>
        }

        {/* Sidebar */}
        <Col xs={4} className="vh-100 bg-light p-3 d-flex flex-column justify-content-between d-none d-sm-flex">
          <div style={{
            overflow: 'auto'
          }}>
            <InputGroup className="mb-3" style={{
              position: 'sticky',
              top: '0px',
              zIndex: 2
            }}>
              <Form.Control
                type="text"
                placeholder="Search for a user"
                aria-label="Search for a user"
                style={{ borderRadius: '25px' }}
                value={searchData.search}
                onChange={(e) => updateSearch(e)}
              />
              <InputGroup.Text
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0 25px 25px 0',
                }}
              >
              </InputGroup.Text>
            </InputGroup>
            <ul className="list-unstyled">
              {filteredUsers.map((user) => (
                <User key={user._id} data={user} count={user.count} setCountToZero={setCountToZero} updateSideBar={updateSideBar}/>
              ))}
            </ul>
          </div>

          {/* Logged-in user info and logout button */}
          <div className="d-flex justify-content-between align-items-center p-2 border-top">
            <span className="fw-bold">{username}</span>
            <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
          </div>
        </Col>

        {/* Main Content */}
        <Col className={`p-0 ${toggleSidebar && "d-none d-sm-block"}`}>
          <Outlet context={toggleSidebar}/>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatLayout;
