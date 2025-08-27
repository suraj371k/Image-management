import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/userStore";

// lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NavigationBar = lazy(() => import("./components/Navbar"));

const App = () => {
  const { user, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);
  
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        {user && <NavigationBar />}
        <Routes>
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
