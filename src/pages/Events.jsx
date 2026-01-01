import { useContext, useEffect, useState } from "react";
import { NavbarContext } from "../context/AllContext";
import SignInPage from "./SignInPage";
import axios from "axios";
import { API_URL } from "../Constants";
import LoadingAnimation from "../components/LoadingAnimation";


export default function Events() {
  const { showSignin } = useContext(NavbarContext);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchEvents() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/getAllEvents`);
      setEvents(data.events);
      console.log(data.events);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <>
      <div className="w-full h-svh bg-red-400 grid grid-cols-4 text-white font-bold text-3xl gap-5 py-5!">
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          events.map((event) => (
            <div className="w-full bg-green-400 flex items-center flex-col">
              {/* PAPALITAN NALANG ITO NG IMAGE */}
              <div className="w-5/12 aspect-square bg-amber-300"></div>
              {/*HANGGANG HERE */}

              <h1>{event.title}</h1>
              <p>{event.description}</p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      {showSignin && <SignInPage />}
    </>
  );
}
