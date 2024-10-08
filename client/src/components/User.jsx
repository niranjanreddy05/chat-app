import { useState } from "react";
import { Link } from "react-router-dom";

const User = ({ data }) => {
  const userContainerStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    padding: '10px 15px',
    margin: '5px 0',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s',
  };

  const usernameStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0',
  };


  const [isHovered, setIsHovered] = useState(false);


  return (
    <Link to={`/chat/user/${data._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          ...userContainerStyle,
          backgroundColor: isHovered ? '#e0e0e0' : '#f0f0f0',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p style={usernameStyle}>{data.username}</p>
      </div>
    </Link>
  );
};

export default User;
