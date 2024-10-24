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


export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    await customFetch.post('/auth/register', data);
    toast.success('Successfully Registered')
    return redirect('/');
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.msg);
    return null;
  }
}

const Register = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <RouterForm className="p-4 rounded shadow-lg" style={{ maxWidth: '400px', width: '100%' }} method='POST'>
        <h3 className="text-center mb-3">Register</h3>

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
          Register
        </Button>
        <p className='text-center mt-3'>Already have an account? <Link to={'/'}>Login</Link></p>
      </RouterForm>
    </Container>
  );
};

export default Register;