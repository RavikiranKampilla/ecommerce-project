import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <>
      <Navbar />
      <div className="container">
        <h2>🎉 Order Successful</h2>
        <p>Your order has been placed.</p>

        <Link to="/">Go to Home</Link>
      </div>
    </>
  );
}
