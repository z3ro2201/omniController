"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserTableRow } from "@/types/MemberType";

const MemberListPageLayout = () => {
  const [list, setList] = useState<UserTableRow[]>([]);

  const getList = async () => {
    try {
      const res = await fetch("/api/users/list", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setList([]);
        return false;
      }

      setList(json.resultData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      getList();
    })();
  }, []);

  return (
    <>
      <div className="p-2">
        <div className="flex gap-1">
          <div className="w-[80px]">순서</div>
          <div className="w-[110px]">ID</div>
          <div className="w-[80px]">이름</div>
          <div className="w-[50px]">관리자여부</div>
        </div>
        {list && list.length > 0 ? (
          list.map((item, key: number) => (
            <div className="flex gap-1" key={key}>
              <div className="w-[80px]">{item.id}</div>
              <div className="w-[110px]">{item.user_id}</div>
              <div className="w-[80px]">{item.user_name}</div>
              <div className="w-[50px]">{item.isAdmin === 1 ? "여" : "부"}</div>
            </div>
          ))
        ) : (
          <div>사용자를 등록해주세요.</div>
        )}
      </div>
      <div className="text-right">
        <Link href="./add">등록</Link>
      </div>
    </>
  );
};

export default MemberListPageLayout;
