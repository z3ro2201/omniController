const LoginPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center text-[14px]">
      <div>
        <div className="relative block">
          <label className="py-2 pl-3 m-2 absolute" htmlFor="txtInputId">
            아이디
          </label>
          <input type="text" id="txtInputId" className="m-2 py-3 pr-2 pl-[80px] border border-gray-200 rounded-lg" />
        </div>
        <div className="relative block">
          <label className="py-2 pl-3 m-2 absolute" htmlFor="txtInputPw">
            비밀번호
          </label>
          <input type="password" id="txtInputPw" className="m-2 py-3 pl-[80px] pr-2 border border-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
