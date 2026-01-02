"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userPw, setUserPw] = useState<string>("");

  const submitLogin = async () => {
    const user_id = userId.trim();
    const user_pw = userPw ?? "";

    if (!user_id) {
      alert("아이디를 입력하세요.");
      return false;
    }

    if (!user_pw) {
      alert("비밀번호를 입력하세요.");
      return false;
    }

    const payload = { user_id, user_pw };
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();

      if (!res.ok) {
        alert(json.resultMsg);
        return false;
      }

      router.replace("/mgnt/main");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center text-[14px]">
      <div>
        <div className="relative block">
          <label className="py-2 pl-3 m-2 absolute" htmlFor="txtInputId">
            아이디
          </label>
          <input type="text" id="txtInputId" className="m-2 py-3 pr-2 pl-[80px] border border-gray-200 rounded-lg" value={userId} onChange={(event) => setUserId(event.target.value)} />
        </div>
        <div className="relative block">
          <label className="py-2 pl-3 m-2 absolute" htmlFor="txtInputPw">
            비밀번호
          </label>
          <input type="password" id="txtInputPw" className="m-2 py-3 pl-[80px] pr-2 border border-gray-200 rounded-lg" value={userPw} onChange={(event) => setUserPw(event.target.value)} />
        </div>
        <div className="block">
          <button type="button" className="block w-full border p-2" onClick={() => submitLogin()}>
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
