import SideNavbar from "../components/sideNavbar/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      <SideNavbar></SideNavbar>
      <div className="grow p-12 md:overflow-y-auto">{children}</div>
    </div>
  );
}
