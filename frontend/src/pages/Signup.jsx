import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import toast from "react-hot-toast";

const Signup = () => {
  const { loading, error, signupUser } = useUserStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(formData);
      toast.success("signup successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className=" bg-[#220135]  w-full h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-lg flex flex-col items-center outline-2 outline-black  rounded-4xl h-auto bg-[#111111] pt-10 text-white px-10 gap-3"
      >
        <h2 className="text-2xl font-bold  text-[#edf2f4] ">
          Join us to manage your Images
        </h2>
        <div className="flex gap-1 mt-5 flex-col w-full">
          <label htmlFor="">Full Name</label>
          <input
            value={formData.username}
            onChange={handleInputChange}
            name="username"
            className="py-2 bg-zinc-800 p-5"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="flex gap-1 mt-5 flex-col w-full">
          <label htmlFor="">Email</label>
          <input
            value={formData.email}
            onChange={handleInputChange}
            name="email"
            className="py-2 bg-zinc-800 p-5"
            type="email"
            placeholder="john@gmail.com"
            required
          />
        </div>
        <div className="flex gap-1 mt-5 flex-col w-full">
          <label htmlFor="">Password</label>
          <input
            value={formData.password}
            onChange={handleInputChange}
            name="password"
            className="py-2 bg-zinc-800 p-5"
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <div className="w-full mt-5">
          <button
            type="submit"
            className="w-full bg-purple-800 py-2 text-white font-bold rounded-xl"
          >
            {loading ? "Signing up.." : "Sign up"}
          </button>
        </div>
        <p className="text-white py-5 ">
          Already have an account?{" "}
          <Link className="text-purple-800" to={"/login"}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
