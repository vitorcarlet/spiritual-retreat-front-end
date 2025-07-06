// import { auth } from "auth";
// import getServerSession from "next-auth";
import DashboardPage from "../../serverTest/page";

export default function Page() {
  return <DashboardPage />;
}

// export async function getServerSideProps(context: any) {
//   return {
//     props: {
//       session: await getServerSession(context.req, context.res, authOptions),
//     },
//   };
// }
