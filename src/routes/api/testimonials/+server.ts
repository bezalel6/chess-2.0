import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const testimonials = [
	{
		quote: "We got Chess 2 before GTA 6.",
		author: "— Gary, Professional Gamer",
	},
	{
		quote: "Finally, they fixed all the bugs from Chess 1.",
		author: "— Magnus, Endgame Enjoyer",
	},
	{
		quote: "Literally don't care.",
		author: "— Hikaru, Variety Streamer",
	},
	{
		quote: "This is the position. And in this position, we resign.",
		author: "— Levy, New Yorker",
	},
	{
		quote: "You know who also made a sequel? Europe, 1939.",
		author: "— Ben, Old Guy",
	},
	{
		quote: "As long as there’s stalemate tricks, you have my vote.",
		author: "— Eric, Tea Influencer",
	},
	{
		quote: "As long as it has ultrabullet.",
		author: "— Daniel, Destroyer of Mice",
	},
	{
		quote: "I don't know, this looks kinda sus, not gonna lie.",
		author: "— Alexandra, Sister",
	},
	{
		quote: "It speaks for itself, or something.",
		author: "— Hans, Soothsayer",
	},
];

export const GET: RequestHandler = async () => {
	return json(testimonials);
};
