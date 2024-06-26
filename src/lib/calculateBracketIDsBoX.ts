// hardcoded because I value my time and sanity
export const calculateChallongeIdsDoubleElimination = (amountOfTeams: number) => {
	switch (amountOfTeams) {
		case 4:
			return {
				'1-1': 1,
				'1-2': 2,
				'2-1': 4,
				'3-1': 6,
				'4-1': 3,
				'5-1': 5
			};
		case 5:
			return {
				'1-1': 1,
				'2-1': 3,
				'2-2': 2,
				'3-1': 6,
				'4-1': 8,
				'5-1': 4,
				'6-1': 5,
				'7-1': 7
			};
		case 6:
			return {
				'1-1': 1,
				'1-2': 2,
				'2-1': 3,
				'2-2': 4,
				'3-1': 8,
				'4-1': 10,
				'5-1': 6,
				'5-2': 5,
				'6-1': 7,
				'7-1': 9
			};
		case 7:
			return {
				'1-1': 1,
				'1-2': 2,
				'1-3': 3,
				'2-1': 5,
				'2-2': 6,
				'3-1': 10,
				'4-1': 12,
				'5-1': 4,
				'6-1': 8,
				'6-2': 7,
				'7-1': 9,
				'8-1': 11
			};
		case 8:
			return {
				'1-1': 1,
				'1-2': 2,
				'1-3': 3,
				'1-4': 4,
				'2-1': 7,
				'2-2': 8,
				'3-1': 12,
				'4-1': 14,
				'5-1': 5,
				'5-2': 6,
				'6-1': 10,
				'6-2': 9,
				'7-1': 11,
				'8-1': 13
			};
		default:
			console.error(`Sorry, we are out`);
	}
};

export const calculateBoXDoubleElimination = (amountTeams: number, matchNumber: number) => {
	switch (amountTeams) {
		case 4:
			return 3;
		case 5:
			if (matchNumber === 7) return 1;
			return 3;
		case 6:
			if (matchNumber === 7 || matchNumber === 9) return 1;
			return 3;
		case 7:
			if (matchNumber === 9 || matchNumber === 11) return 1;
			return 3;
		case 8:
			if (matchNumber === 11 || matchNumber === 13) return 1;
			return 3;
	}
	return 3;
};
