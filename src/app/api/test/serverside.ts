// // Exemplo numa API Route
// import { getToken } from "next-auth/jwt";
// import axios from "axios";

// export default async function handler(req, res) {
//   const token = await getToken({ req });

//   const apiResponse = await axios.get("http://localhost:3001/secure-route", {
//     headers: {
//       Authorization: `Bearer ${token?.accessToken}`,
//     },
//   });

//   res.status(200).json(apiResponse.data);
// }
