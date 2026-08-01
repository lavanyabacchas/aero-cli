import React, { useState } from 'react';

export const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-4 border rounded bg-zinc-900 text-white space-y-2">
      <h3 className="font-bold">Contact Us</h3>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" className="p-2 bg-black border rounded text-xs w-full" />
      <button type="submit" className="px-3 py-1 bg-white text-black text-xs font-bold rounded">Submit</button>
      {submitted && <div className="text-emerald-400 text-xs">Message Sent!</div>}
    </form>
  );
};
