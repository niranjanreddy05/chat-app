import { useState } from "react";
import { Link } from "react-router-dom";

const User = ({ data, count, setCountToZero }) => {
  const userContainerStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    padding: '10px 15px',
    margin: '5px 0',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s',
    position: 'relative',
  };

  const usernameStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0',
    flex: 1, 
  };

  const countStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '50%', 
    width: '25px', 
    height: '25px', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: '10px', 
    top: '50%',
    transform: 'translateY(-50%)', 
    fontSize: '0.9rem',
  };

  const [isHovered, setIsHovered] = useState(false);
  console.log(count);

  return (
    <Link to={`/chat/user/${data._id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => {
      setCountToZero(data._id)
    }}>
      <div
        style={{
          ...userContainerStyle,
          backgroundColor: isHovered ? '#e0e0e0' : '#f0f0f0',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p style={usernameStyle}>{data.username}</p>
        { count > 0 && (
          <div style={countStyle}>{count}</div>
        )}
      </div>
    </Link>
  );
};

export default User;
