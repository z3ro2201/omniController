import Link from "next/link";

import { AirVentIcon } from "lucide-react";

const MainPage = () => {
  return (
    <>
      <Link className="m-2 p-4 inline-block border border-gray-200 bg-white dark:border-white dark:text-white rounded-lg" href="/control/remote/airConditioner" target="_blank">
        <AirVentIcon className="mr-2 inline-block" size={16} />
        에어컨 리모컨
      </Link>
    </>
  );
};

export default MainPage;
