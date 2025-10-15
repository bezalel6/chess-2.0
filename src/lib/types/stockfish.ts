// Stockfish engine type definitions

export interface AnalysisResult {
	bestMove: string; // e.g., "e2e4"
	evaluation: number; // Centipawn evaluation
	depth: number; // Depth reached
	nodes: number; // Nodes searched
	nps: number; // Nodes per second
	time: number; // Time spent in milliseconds
	pv: string[]; // Principal variation (best line)
	mate?: number; // Mate in X moves (if applicable)
	selectiveDepth?: number; // Selective search depth
	multiPV?: number; // Line number when analyzing multiple lines
}

export interface EngineConfig {
	depth?: number; // Search depth (default: 20)
	moveTime?: number; // Max time per move in ms
	threads?: number; // Number of threads
	hash?: number; // Hash table size in MB
	multiPV?: number; // Number of lines to analyze
}

export interface EngineOptions {
	Threads?: number;
	Hash?: number; // Hash table size in MB
	MultiPV?: number; // Number of lines to analyze
	Contempt?: number; // Avoidance of draws (-100 to 100)
	Ponder?: boolean; // Think on opponent's time
	UCI_Chess960?: boolean; // Fischer Random Chess support
	UCI_AnalyseMode?: boolean; // Optimize for analysis
}

export type UCICommand =
	| 'uci'
	| 'isready'
	| 'ucinewgame'
	| 'quit'
	| 'stop'
	| `position fen ${string}`
	| `position startpos moves ${string}`
	| `go depth ${number}`
	| `go movetime ${number}`
	| `go infinite`
	| `setoption name ${string} value ${string | number}`;
