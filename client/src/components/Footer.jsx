
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-1 mb-4 md:mb-0">
          <span className="font-bold text-lg tracking-tight text-black">Pawfolio</span>
          <span className="text-lg">🐾</span>
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Pawfolio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
