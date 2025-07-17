// import { auth } from "auth";
// import getServerSession from "next-auth";
"use client";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <div>Dashboard Page</div>
  );
}

// export async function getServerSideProps(context: any) {
//   return {
//     props: {
//       session: await getServerSession(context.req, context.res, authOptions),
//     },
//   };
// }
