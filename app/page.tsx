"use client";
import { useState } from "react";
import { button as buttonStyles} from "@heroui/theme";
import { title } from "@/components/primitives";
import { motion } from "framer-motion";
import {Card, CardBody} from "@heroui/react";
interface FlashcardProps {
  question: string;
  answer: string;
}

function Flashcard({ question, answer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="cursor-pointer perspective"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-40 text-center transition-transform duration-500"
        animate={{ rotateY: flipped ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="absolute w-full h-full backface-hidden flex items-center justify-center text-lg bg-white shadow-xl rounded-2xl border border-violet-500">
          <CardBody>{question}</CardBody>
        </Card>

        <Card className="absolute w-full h-full rotate-y-180 backface-hidden flex items-center justify-center text-lg shadow-xl rounded-2xl border border-violet-500">
          <CardBody>{answer}</CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}

const Input = ({ onSend }: { onSend: (text: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        type="text"
        placeholder="Enter the subject"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
      />
      <button
        className={buttonStyles({
          color: "primary",
          radius: "full",
          variant: "shadow",
        })}
        onClick={() => {
          console.log(value);
          onSend(value);
        }}
      >
        =&gt;
      </button>
    </>
  );
};

export default function Home() {
  const [cards, setCards] = useState<{ question: string; answer: string }[]>([]);
  const [partial, setPartial] = useState("");

  const sendTopic = async (topic: string) => {
    try {
      const response = await fetch("http://localhost:8000/negotiations/generate-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }

      const data = await response.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Let's check your knowledge</span>
      </div>
      <div className="flex gap-3">
        <Input onSend={sendTopic} />
      </div>

      <div className="mt-8 grid gap-4 w-full max-w-2xl">
        {cards.map((card, index) => (
          <Flashcard key={index} question={card.question} answer={card.answer} />
        ))}
      </div>
    </section>
  );
}
