import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeLayout from './pages/HomeLayout';
import Error from './pages/Error';
import ChatLayout from './pages/ChatLayout';
import DefaultChatArea from './pages/DefaultChatArea';
import ChatArea from './pages/ChatArea';
import { SocketProvider } from './components/SocketProvider';



import { loader as ChatAreaLoader } from './pages/ChatArea';

import { action as RegisterAction } from './pages/Register';
import { action as LoginAction } from './pages/Login';


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children:
      [
        {
          index: true,
          element: <Login />,
          action: LoginAction
        },
        {
          path: 'register',
          element: <Register />,
          action: RegisterAction
        },
        {
          path: 'chat',
          element: <ChatLayout />,
          children:
            [
              {
                index: true,
                element: <DefaultChatArea />
              },
              {
                path: 'user/:id',
                element: <ChatArea />,
                loader: ChatAreaLoader
              }
            ]
        }
      ]
  }
])

function App() {

  return (
    <>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </>
  )
}

export default App;
