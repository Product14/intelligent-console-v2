import { FaRegAngry } from 'react-icons/fa';
import { IoMdHappy } from 'react-icons/io';
import { IoMdSad } from 'react-icons/io';
import { MdSentimentNeutral } from 'react-icons/md';

export enum Sentiments {
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  ANGRY = 'angry',
}

export const SentimentColorMap: Record<Sentiments, string> = {
  [Sentiments.HAPPY]: '#00B53F',
  [Sentiments.NEUTRAL]: '#0073B5',
  [Sentiments.SAD]: '#DDA227',
  [Sentiments.ANGRY]: '#B50000',
};

export const SentimentLabelMap: Record<Sentiments, string> = {
  [Sentiments.HAPPY]: 'Positive',
  [Sentiments.NEUTRAL]: 'Neutral',
  [Sentiments.SAD]: 'Sad',
  [Sentiments.ANGRY]: 'Angry',
};

export const SentimentEmojiMap: Record<Sentiments, string> = {
  [Sentiments.HAPPY]: '😊',
  [Sentiments.NEUTRAL]: '😐',
  [Sentiments.SAD]: '🙁',
  [Sentiments.ANGRY]: '😡',
};

export const SentimentIconMap: Record<Sentiments, React.ComponentType> = {
  [Sentiments.HAPPY]: IoMdHappy,
  [Sentiments.NEUTRAL]: MdSentimentNeutral,
  [Sentiments.SAD]: IoMdSad,
  [Sentiments.ANGRY]: FaRegAngry,
};

export const SentimentOptions = [
  {
    text: 'All Sentiments',
    value: 'all',
  },
  {
    text: SentimentLabelMap[Sentiments.HAPPY],
    value: Sentiments.HAPPY,
  },
  {
    text: SentimentLabelMap[Sentiments.NEUTRAL],
    value: Sentiments.NEUTRAL,
  },
  {
    text: SentimentLabelMap[Sentiments.SAD],
    value: Sentiments.SAD,
  },
  {
    text: SentimentLabelMap[Sentiments.ANGRY],
    value: Sentiments.ANGRY,
  },
];

export const IntentOptions = [
  {
    text: 'All Intents',
    value: 'all',
  },
  {
    text: 'Test Drive',
    value: 'test drive',
  },
  {
    text: 'Service',
    value: 'service',
  },
  {
    text: 'Finance',
    value: 'finance',
  },
  {
    text: 'Parts & Accessories',
    value: 'parts & accessories',
  },
  {
    text: 'General Inquiry',
    value: 'general inquiry',
  },
];

export const OutcomeOptions = [
  {
    text: 'All Outcomes',
    value: 'all',
  },
  {
    text: 'Resolved',
    value: 'yes',
  },
  {
    text: 'Not Resolved',
    value: 'no',
  },
  {
    text: 'Abandoned',
    value: 'abandoned',
  },
];
