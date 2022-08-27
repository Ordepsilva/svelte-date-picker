<script lang="ts">
	import moment from 'moment';
	import { onMount } from 'svelte';
	import { iso } from './DaysView.svelte';

	type Dates = Record<string, Date[]>;
	type Subtitle = Record<string, string>[];

	export let selectedDates: Dates = {};
	export let subtitles: Subtitle = [];
	export let language: string = 'en';

	let weekDaysShort: string[] = [];
	let monthNames: string[] = [];
	let filteredDates: Dates;
	let datesToDisplay: Dates;
	let currentMonthIndex: number = new Date().getMonth();
	let selectedYear: number = new Date().getFullYear();
	let startDate: Date = new Date();
	let start: number = 0;
	let keys: string[] = [];

	onMount(async () => {
		if (language) {
			moment.locale(language);
			weekDaysShort = moment.weekdaysShort();
			monthNames = moment.months();
		}
	});

	function deepCopy<T>(source: T): any {
		return Array.isArray(source)
			? source.map((item) => deepCopy(item))
			: source instanceof Date
			? new Date(source.getTime())
			: source && typeof source === 'object'
			? Object.getOwnPropertyNames(source).reduce((o, prop) => {
					Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
					o[prop] = deepCopy((source as { [key: string]: any })[prop]);
					return o;
			  }, Object.create(Object.getPrototypeOf(source)))
			: (source as T);
	}

	function generateFilteredDays(selectedDates: Dates) {
		let tempfilteredDates: any;
		keys = [];

		if (selectedDates) {
			tempfilteredDates = deepCopy(selectedDates);

			for (var key in filteredDates) {
				keys.push(key);
			}

			for (var i = keys.length - 1; i >= 0; i--) {
				const key = keys[i];
				if (tempfilteredDates[key] && tempfilteredDates[key].length > 0) {
					for (let j = 0; j < tempfilteredDates[key].length; j++) {
						for (let k = i - 1; k >= 0; k--) {
							if (tempfilteredDates[keys[k]].length > 0) {
								let index = tempfilteredDates[keys[k]].findIndex(
									(val: any) => iso(new Date(val)) == iso(new Date(tempfilteredDates[key][j]))
								);
								if (index != -1) {
									tempfilteredDates[keys[k]].splice(index, 1);
								}
							}
						}
					}
				}
			}
		}
		return tempfilteredDates;
	}

	function getDaysForCurrentMonth(
		filteredDates: Dates,
		currentMonthIndex: number,
		currentYear: number
	) {
		datesToDisplay = {};
		for (let key in filteredDates) {
			datesToDisplay[key] = filteredDates[key].filter((date) => {
				if (date.getMonth() == currentMonthIndex && currentYear == date.getFullYear()) {
					return date;
				}
			});
		}
	}

	function sortDates(datesToDisplay: any) {
		for (let key in datesToDisplay) {
			if (datesToDisplay[key].length > 1) {
				datesToDisplay[key].sort((date1: any, date2: any) => date1 - date2);
			}
		}
	}

	function changeMonth(direction: number) {
		if (currentMonthIndex == 11 && direction > 0) {
			currentMonthIndex = 0;
			selectedYear = selectedYear + direction;
			return;
		} else if (currentMonthIndex == 0 && direction < 0) {
			currentMonthIndex = 11;
			selectedYear = selectedYear + direction;
			return;
		}

		currentMonthIndex = currentMonthIndex + direction;
	}

	function viewDateFrom(date: Date, currentMonthIndex: number) {
		if (!date) {
			date = new Date();
		}
		var viewDate = new Date(date);

		viewDate.setFullYear(selectedYear, currentMonthIndex, 1);

		return viewDate;
	}

	function weeksFrom(viewDate: any, start: number, datesToDisplay: any) {
		let first = new Date(viewDate.getTime());
		first.setDate(1);
		first.setDate(first.getDate() + ((start - first.getDay() - 7) % 7));

		let last = new Date(viewDate.getTime());
		last.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate());
		last.setDate(last.getDate() + ((start - last.getDay() + 6) % 7));
		let date = new Date(first.getTime()),
			month = viewDate.getMonth(),
			year = viewDate.getFullYear(),
			week: any[] = [],
			weeks = [week];

		while (date.getTime() <= last.getTime()) {
			let dd = date.getDate(),
				mm = date.getMonth(),
				yy = date.getFullYear(),
				value = date;

			week.push({
				date: dd,
				value,
				class: [mm == month ? '' : (mm > month ? yy >= year : yy > year) ? 'future' : 'past'].join(
					' '
				),
				background: ''
			});

			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

			if (date.getDay() === start) {
				week = [];
				weeks.push(week);
			}
		}

		for (let key in datesToDisplay) {
			for (let i = 0; i < datesToDisplay[key].length; i++) {
				let className = '';
				switch (true) {
					case datesToDisplay[key].length == 1:
						className = 'single-selected';
						break;

					case i == 0 &&
						datesToDisplay[key][i + 1].getDate() - datesToDisplay[key][i].getDate() != 1:
						className = 'single-selected';
						break;

					case i == 0 &&
						datesToDisplay[key][i + 1].getDate() - datesToDisplay[key][i].getDate() == 1:
						className = 'left-conner';
						break;

					case i == datesToDisplay[key].length - 1 &&
						datesToDisplay[key][i].getDate() - datesToDisplay[key][i - 1].getDate() != 1:
						className = 'single-selected';
						break;

					case i == datesToDisplay[key].length - 1 &&
						datesToDisplay[key][i].getDate() - datesToDisplay[key][i - 1].getDate() == 1:
						className = 'right-conner';
						break;

					case datesToDisplay[key][i].getDate() - datesToDisplay[key][i - 1].getDate() != 1 &&
						datesToDisplay[key][i + 1].getDate() - datesToDisplay[key][i].getDate() == 1:
						className = 'left-conner';
						break;

					case datesToDisplay[key][i].getDate() - datesToDisplay[key][i - 1].getDate() == 1 &&
						datesToDisplay[key][i + 1].getDate() - datesToDisplay[key][i].getDate() != 1:
						className = 'right-conner';
						break;

					case datesToDisplay[key][i].getDate() - datesToDisplay[key][i - 1].getDate() != 1 &&
						datesToDisplay[key][i + 1].getDate() - datesToDisplay[key][i].getDate() != 1:
						className = 'single-selected';
						break;

					default:
						className = 'selected';
						break;
				}
				for (let w = 0; w < weeks.length; w++) {
					let index = weeks[w].findIndex((date) => iso(date.value) == iso(datesToDisplay[key][i]));

					if (index != -1) {
						weeks[w][index].background = key;
						weeks[w][index].class = className;
					}
				}
			}
		}

		return weeks;
	}

	$: filteredDates = generateFilteredDays(selectedDates);

	$: year = viewDate.getFullYear();

	$: getDaysForCurrentMonth(filteredDates, currentMonthIndex, year);

	$: sortDates(datesToDisplay);

	$: month = monthNames[viewDate.getMonth()];

	$: viewDate = viewDateFrom(startDate, currentMonthIndex);

	$: weeks = weeksFrom(viewDate, start, datesToDisplay);
</script>

<div class="picker-view-wrapper">
	<div class="header">
		<span>{`${month} ${year}`}</span>
		<div class="arrow-buttons flex">
			<button class="flex pointer" on:click={() => changeMonth(-1)}
				><i class="material-icons arrow "> keyboard_arrow_left </i></button
			>
			<button class="flex pointer" on:click={() => changeMonth(+1)}
				><i class="material-icons "> keyboard_arrow_right </i></button
			>
		</div>
	</div>
	<div>
		<table>
			<tr>
				{#each weekDaysShort as day}
					<th>{day}</th>
				{/each}
			</tr>
			{#each weeks as week}
				<tr>
					{#each week as day}
						<td
							class="btn  {day.class}"
							style="{day.background != '' ? `background-color: ${day.background}` : ''};"
							><span class="" style="color:{day.background != '' ? 'white' : '#272932'}"
								>{day.date}</span
							></td
						>
					{/each}
				</tr>
			{/each}
		</table>
	</div>

	<div class="subtitles-wrapper">
		{#if subtitles && subtitles}
			{#each subtitles as subtitle}
				<div class="subtitle ">
					<span class="circle" style="background: {subtitle.color};" />
					<span class="overline dark-grey subtitle-label">{subtitle.label}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.picker-view-wrapper {
		border: 2px 10px;
	}
	table{
		border-spacing: 0px 5px;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	th {
		padding-top: 10px;
		width: 30px;
		font-size: 12px;
	}
	td {
		text-align: center;
		width: 25px;
		height: 25px;
	}

	.future,
	.past {
		opacity: 0;
	}

	.circle {
		display: block;
		border-radius: 50%;
		height: 12px;
		width: 12px;
		margin: 0;
	}

	.subtitle {
		display: flex;
		align-items: center;
		margin-top: 10px;
	}

	.subtitle-label {
		padding-left: 10px;
	}

	.subtitles-wrapper > .subtitle:first-child {
		padding-top: 0px;
	}
	.subtitles-wrapper > .subtitle {
		padding-top: 10px;
	}

	.single-selected {
		border-radius: 50%;
		background-clip: content-box;
	}

	.left-conner {
		border-top-left-radius: 30px;
		border-bottom-left-radius: 30px;
	}
	.right-conner {
		border-top-right-radius: 30px;
		border-bottom-right-radius: 30px;
	}

	.arrow-buttons {
		display: flex;
		align-items: center;
	}
	.arrow-buttons > button {
		display: flex;
		align-items: center;
		border: none;
		cursor: pointer;
		background-color: white;
	}
</style>
