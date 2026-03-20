import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout({ user, logout }) {
  return (
    <>
      <Header user={user} logout={logout} />
      <main><Outlet /></main>
    </>
  );
}
