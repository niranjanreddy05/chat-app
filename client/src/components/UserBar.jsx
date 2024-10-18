import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Dropdown from "react-bootstrap/Dropdown";
import { ThreeDotsVertical } from 'react-bootstrap-icons';

const UserBar = ({ user, status, onClearChat }) => {
  return (
    <Row className="bg-light border-bottom py-2 px-3 m-0 align-items-center">
      <Col>
        <h4 className="mb-0">
          {user?.username || "User"}
        </h4>
        {status && (
          <p
            style={{
              marginBottom: '0px',
              color: '#a6a6a6',
              fontSize: '15px',
            }}
          >
            {status === 'Online' && (
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'green',
                  borderRadius: '50%',
                  marginRight: '5px',
                  marginBottom: '0',
                }}
              ></span>
            )}
            {status}
          </p>
        )}
      </Col>
      <Col xs="auto">
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            bsPrefix="custom-toggle"
            className="text-muted p-0"
            style={{ cursor: 'pointer' }}
          >
            <ThreeDotsVertical size={20} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={onClearChat}>Clear Chat</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default UserBar;