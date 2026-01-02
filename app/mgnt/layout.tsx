"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

import { UsersIcon, LogOutIcon, AirVentIcon } from "lucide-react";
import { usePathname } from "next/navigation";

const ManagementPageLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const getMyPermission = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (!res.ok) {
        setError("권한불러오기 오류");
        return console.error(json);
      }
      setIsAdmin(json?.resultData?.user?.isAdmin ?? false);
    } catch (error) {
      console.error(error);
      setError("오류");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    (async () => {
      getMyPermission();
    })();
  }, []);

  if (!isLoaded) return <>권한을 불러오는중입니다.</>;
  if (error) return <>{error}</>;

  return (
    <>
      <div className="w-screen px-4 py-2 flex justify-between items-center bg-violet-500 text-white">
        <Link href="/mgnt/main">
          <h1 className="font-bold text-[24px]">OMNI Controller</h1>
        </Link>
        <ul className="h-[40px] flex gap-2 items-center text-[14px]">
          {isAdmin ? (
            <li>
              <Link className="flex items-center gap-1" href="/mgnt/users/member/list">
                <UsersIcon size={16} />
                사용자관리
              </Link>
            </li>
          ) : (
            <></>
          )}
          {pathname !== "/mgnt/main" ? (
            <li>
              <Link className="flex items-center gap-1" href="/control/remote/airConditioner" target="_blank">
                <AirVentIcon size={16} />
                에어컨 관리 (새창)
              </Link>
            </li>
          ) : (
            <></>
          )}
          <li>
            <Link className="flex items-center gap-1" href="/auth/logout">
              <LogOutIcon size={16} />
              로그아웃
            </Link>
          </li>
        </ul>
      </div>
      <div className="px-4 py-2">{children}</div>
    </>
  );
};

export default ManagementPageLayout;
