import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import ThemeWrapper from "../themeProvider";
import theme from "@/src/theme/theme";
import EmotionCacheProvider from "@/src/components/navbar/mui/EmotionCacheProvider";
// export const metadata = {
//   title: "Protected Routes",
// };

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <EmotionCacheProvider>
        <ThemeWrapper theme={theme}>
          {/* <SessionProvider session={session}> */}
          <div>{children}</div>
          {/* </SessionProvider> */}
        </ThemeWrapper>
      </EmotionCacheProvider>
    </SessionProvider>
    //   <Navbar />
  );
}
