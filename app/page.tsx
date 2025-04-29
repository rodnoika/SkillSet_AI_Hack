/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";
import { useState } from "react";
import { button as buttonStyles } from "@heroui/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody } from "@heroui/react";

import { title } from "@/components/primitives";

interface FlashcardProps {
  question: string;
  answer: string;
}

function Flashcard({ question, answer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer perspective"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        className="relative w-full h-40 text-center"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
        }}
      >
        <Card
          className="absolute w-full h-full flex items-center justify-center text-lg shadow-xl rounded-2xl border border-violet-700"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <CardBody>{question}</CardBody>
        </Card>

        <Card
          className="absolute w-full h-full flex items-center justify-center text-lg shadow-xl rounded-2xl border border-violet-500"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <CardBody>{answer}</CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

const Input = ({ onSend }: { onSend: (text: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        placeholder="Enter the subject"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <motion.button
        className={buttonStyles({
          color: "primary",
          radius: "full",
          variant: "shadow",
        })}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 10,
          visualDuration: 0.2,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSend(value)}
      >
        =&gt;
      </motion.button>
    </>
  );
};

export default function Home() {
  const [cards, setCards] = useState<{ question: string; answer: string }[]>(
    [],
  );

  const sendTopic = async (topic: string) => {
    try {
      const response = await fetch("/api/negotiations/generate-cards", {
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
  const searchVariants = {
    initial: { y: 0, opacity: 1 },
    movedUp: {
      y: -60,
      opacity: 0.8,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="flex flex-col h-full items-center justify-center gap-4 py-8 md:py-10">
      <motion.div
        animate={cards.length > 0 ? "movedUp" : "initial"}
        className="flex flex-col items-center justify-center gap-4"
        initial="initial"
        variants={searchVariants}
      >
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Let&apos;s check your knowledge</span>
        </div>
        <div className="flex gap-3">
          <Input onSend={sendTopic} />
        </div>
      </motion.div>

      <div className="mt-8 w-full max-w-2xl">
        <AnimatePresence>
          {cards.length > 0 && (
            <motion.div
              key="cards"
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4"
              exit={{ opacity: 0, y: 20 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {cards.map((card, index) => (
                <Flashcard
                  key={index}
                  answer={card.answer}
                  question={card.question}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
