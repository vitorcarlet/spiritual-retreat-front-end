export const metadata = {
  title: "Protected Routes",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center mx-4 my-6 lg:mt-20">
      {children}
    </div>
  );
}
