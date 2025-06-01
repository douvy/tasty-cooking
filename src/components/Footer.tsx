import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#2f3220] w-full border-t border-dark-gray-top z-50 pt-3 pb-3">
      <div className="container mx-auto flex items-center justify-between px-4 sm:pl-4 sm:pr-0">
        <ul className="text-xs font-normal text-off-white flex items-center w-full">
          <li className="inline-block mr-2 pt-2 pb-2">
            <Link href="/" className="text-lg font-windsor-bold">
              Home
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;