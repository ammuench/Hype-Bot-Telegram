const hypeReplies: string[] = [
  "HYPE",
  "HYYYYYYPE",
  "LET ME CHECK MY WATCH... IT'S HYPE TIME",
  "FUCKING HYPE",
  "GET HYPE",
  "WHEN YOU STARE INTO THE HYPE, THE HYPE STARES BACK",
  "I AM SO HYPE",
  "LET THERE BE HYPE",
  "THERE CAN ONLY BE HYPE",
  "HYPE HYPE HYPE HYPE HYPE",
  "TURN UP THE HYPE",
  "ALL THAT REMAINS IS HYPE",
  "I AM THE HYPE"
];
export class HYPE {
    public hypeReply(): string {
        return hypeReplies[Math.floor(Math.random()*hypeReplies.length)];
    }
}
