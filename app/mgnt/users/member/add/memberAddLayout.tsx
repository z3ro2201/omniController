"use client";
import { useState } from "react";

const UserAddPageLayout = () => {
  const [userId, setUserId] = useState<string | null>("");
  const [userPw, setUserPw] = useState<string | null>("");
  const [userPw2, setUserPw2] = useState<string | null>("");
  const [userName, setUserName] = useState<string | null>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const submitMemberRegist = async () => {
    const payload = { user_id: userId, user_pw: userPw, user_name: userName, isAdmin };
    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conditional-control": "true",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.resultMsg);
        return false;
      }

      alert(json.resultMsg);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="block">
        <label htmlFor="">아이디</label>
        <input type="text" className="border" value={userId ?? ""} onChange={(event) => setUserId(event.target.value)} />
      </div>
      <div className="block">
        <label htmlFor="">비밀번호</label>
        <input type="password" className="border" value={userPw ?? ""} onChange={(event) => setUserPw(event.target.value)} />
      </div>
      <div className="block">
        <label htmlFor="">비밀번호 확인</label>
        <input type="password" className="border" value={userPw2 ?? ""} onChange={(event) => setUserPw2(event.target.value)} />
      </div>
      <div className="block">
        <label htmlFor="">이름</label>
        <input type="text" className="border" value={userName ?? ""} onChange={(event) => setUserName(event.target.value)} />
      </div>
      <div className="block">
        <label htmlFor="">관리자여부</label>
        <input type="checkbox" checked={isAdmin} onChange={(event) => setIsAdmin(event.target.checked)} />
      </div>
      <div className="block">
        <button type="button" className="border" onClick={() => submitMemberRegist()}>
          등록
        </button>
      </div>
    </>
  );
};

export default UserAddPageLayout;
