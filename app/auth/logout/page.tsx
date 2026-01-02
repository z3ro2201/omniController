"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

const LogoutPage = () => {
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout");
      if (!res.ok) return <>로그아웃 중 문제 발생</>;
    } catch (error) {
      console.error(error);
    }
    redirect("/auth/login");
  };

  useEffect(() => {
    (async () => {
      logout();
    })();
  }, []);
};

export default LogoutPage;
