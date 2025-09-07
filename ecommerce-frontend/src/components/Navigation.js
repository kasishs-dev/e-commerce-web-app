// components/Navigation.js
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { totalItems, items, isLoading: cartLoading } = useSelector((state) => state.cart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Kasish&apos;s E-Commerce
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Kasish&apos;s E-Commerce
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role !== "admin" &&<Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>}

            {user?.role !== "admin" &&<Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Products
            </Link>}

            {isAuthenticated() ? (
              <>
                {user?.role !== "admin" &&<Link href="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>}

                {user?.role !== "admin" &&<Link href="/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Orders
                </Link>}

                {user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/user-expenses"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Expenses
                    </Link>
                    <Link
                      href="/admin/sales-reports"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Reports
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 text-sm">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>

                <Link href="/register" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
              {/* Mobile Navigation Links */}
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Home
              </Link>

              <Link
                href="/products"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Products
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    href="/cart"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Cart
                    {totalItems > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Orders
                  </Link>

                  {user?.role === "admin" && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin Panel
                      </div>
                      <Link
                        href="/admin/dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/users"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Users
                      </Link>
                      <Link
                        href="/admin/user-expenses"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        User Expenses
                      </Link>
                      <Link
                        href="/admin/sales-reports"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Sales Reports
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Hello, {user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}