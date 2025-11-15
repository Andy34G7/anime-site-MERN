import "./Contact.css";
import Navbar from "../components/NavBar";
export default function Contact() {
  return (
    <div className="contact-page">
        

      <div className="contact-container">

        {/* LEFT SIDE — FORM */}
        <div className="contact-form">
          <div className="form-grid">
            <div className="input-group">
              <label>FIRST NAME</label>
              <input type="text" placeholder="enter your first name" />
            </div>

            <div className="input-group">
              <label>LAST NAME</label>
              <input type="text" placeholder="enter your last name" />
            </div>
          </div>

          <div className="input-group full">
            <label>EMAIL ADDRESS</label>
            <input type="email" placeholder="enter your email address" />
          </div>

          <div className="input-group full">
            <label>PHONE-NUMBER</label>
            <input type="text" placeholder="enter your phone number" />
          </div>

          <div className="input-group full">
            <label>MESSAGE</label>
            <textarea
              placeholder="enter your comments, feedback or queries here"
              rows="5"
            ></textarea>
          </div>

          <button className="send-btn">SEND MESSAGE</button>
        </div>

        {/* RIGHT SIDE — INFO */}
        <div className="contact-info">
          <div className="info-block">
            <h3>VISIT US</h3>
            <p>Talk to us in person at our Bangalore HQ</p>
            <p className="info-main">123 MG Road, Bengaluru - 560001</p>
          </div>

          <div className="info-block">
            <h3>CALL US</h3>
            <p>Call our team Mon-Fri between 8am-4pm</p>
            <p className="info-main">+(91) 999 9999 999</p>
          </div>

          <div className="info-block">
            <h3>CHAT WITH US</h3>
            <p>Talk with our team via live chat</p>

            <p className="link">Message us on X</p>
            <p className="link">Shoot us an email</p>
            <p className="link">Start a live chat</p>
          </div>
        </div>

      </div>

    </div>
  );
}
