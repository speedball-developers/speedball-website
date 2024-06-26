export interface bracketResultInterface {
	matchNumber: number;
	mapResultId: number;
	scoreTeam1: number;
	scoreTeam2: number;
	team1: string;
	team2: string;
	mapOrder: number;
}

export interface bracketWinOrLoss {
	round: number;
	match: number;
}

export interface bracketMatchInterface {
	round: number;
	match: number;
	team1: string | undefined;
	team2: string | undefined;
	results: bracketResultInterface[];
	resultTeam1: number;
	resultTeam2: number;
	cID: number;
	boX: number;
	win: bracketWinOrLoss | undefined;
	loss: bracketWinOrLoss | undefined;
}
