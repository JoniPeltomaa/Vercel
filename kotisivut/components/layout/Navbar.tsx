"use client"
import { ThemeToggle } from "@/context/ThemeToggle";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SiteNavbar() {
  const pathname = usePathname();
  return (
      <Navbar className="w-3/4 rounded-4xl mx-auto mt-6 bg-nav-bg dark:bg-nav-bg-dark">
        <NavbarBrand href="https://flowbite-react.com">
        </NavbarBrand>
        <div className="flex md:order-2">
          <ThemeToggle />
          <NavbarToggle />
        </div>
        <NavbarCollapse >
          <NavLink 
          href="/" 
          pathname={pathname}
        >
          Etusivu
        </NavLink>
          <NavLink href="/koulutus" pathname={pathname}>Koulutus</NavLink>
          <NavLink href="#" pathname={pathname}>Työpaikat</NavLink>
          <NavLink href="#" pathname={pathname}>Harrastukset</NavLink>
          <NavLink href="#" pathname={pathname}>Projektit</NavLink>
        </NavbarCollapse>
      </Navbar>
  )
}

function NavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <NavbarLink
      as={Link}
      href={href}
      className={`
        uppercase transition-colors duration-200 !important
        ${active ? "text-white! font-semibold!" : "text-gray-400! hover:text-white!"}
      `}
    >
      {children}
    </NavbarLink>
  );
}

export default SiteNavbar;
