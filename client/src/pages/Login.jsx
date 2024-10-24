import React from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { redirect, Form as RouterForm } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import customFetch from '../../utils/customFetch.js';
import { useSocket } from '../components/SocketProvider';
import { useActionData, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const response = await customFetch.post('/auth/login', data, {
      withCredentials: true
    })
    const user = response.data;
    return { user };
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.msg);
    return null;
  }
}

const Login = () => {
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(actionData?.user)
    if (actionData?.user) {
      toast.success('Successfully Logged In');
      localStorage.setItem('userId', actionData.user._id)
      navigate('/chat');
      navigate(0);
    }
  }, [actionData, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <RouterForm className="p-4 rounded shadow-lg" style={{ maxWidth: '400px', width: '100%' }} method="POST">
        <h3 className="text-center mb-3">Login</h3>

        {/* Username Field */}
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faUser} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Enter username"
              name="username"
              required
            />
          </InputGroup>
        </Form.Group>

        {/* Password Field */}
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faLock} />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Enter password"
              name="password"
              required
            />
          </InputGroup>
        </Form.Group>

        {/* Submit Button */}
        <Button
          variant="primary"
          type="submit"
          className="w-100"
          style={{ borderRadius: '25px' }}
        >
          Login
        </Button>
        <p className='text-center mt-3'>Don't have an account? <Link to={'/register'}>Register</Link></p>
      </RouterForm>
    </Container>
  );
};

export default Login;
