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
      <div className="m-2 border-1 border-solid border-violet-300 rounded-md overflow-hidden">
        <div className="flex gap-1 bg-violet-50 text-[14px] font-bold text-center">
          <div className="p-2 w-[80px]">순서</div>
          <div className="p-2 w-[110px] border-l border-solid border-violet-300">ID</div>
          <div className="p-2 w-[80px] border-l border-solid border-violet-300">이름</div>
          <div className="p-2 border-l border-solid border-violet-300">관리자</div>
        </div>
        <div className="flex flex-col text-[13px]">
          {list && list.length > 0 ? (
            list.map((item, key: number) => (
              <div className="flex gap-1 border-t border-solid border-violet-300 text-center" key={key}>
                <div className="p-2 w-[80px]">{item.id}</div>
                <div className="p-2 w-[110px] border-l border-solid border-violet-300">{item.user_id}</div>
                <div className="p-2 w-[80px] border-l border-solid border-violet-300">{item.user_name}</div>
                <div className="p-2 border-l border-solid border-violet-300">{item.isAdmin === 1 ? "여" : "부"}</div>
              </div>
            ))
          ) : (
            <div>사용자를 등록해주세요.</div>
          )}
        </div>
      </div>
      <div className="text-right">
        <Link href="./add">등록</Link>
      </div>
    </>
  );
};

export default MemberListPageLayout;
