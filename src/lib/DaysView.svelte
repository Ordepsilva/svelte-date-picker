<script context="module" lang="ts">
	export function iso(date: Date) {
		const pad = (n: any) => (n < 10 ? '0' + n : n);
		return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
	}
</script>

<script lang="ts">
	import moment from 'moment';
	import { createEventDispatcher, onMount } from 'svelte';
	export let start: number = 0;
	export let range = true;
	export let rangeDaysAfter: number = 7;
	export let autoCreateRange = false;
	export let startDate: Date | undefined = undefined;
	export let endDate: Date | undefined = undefined;
	export let language: string = 'en';
	export let currentMonthIndex: number = new Date().getMonth();
	export let currentYear: number = new Date().getFullYear();
	const dispatch = createEventDispatcher();
	let days: string[] = [];
	let months: string[] = [];

	onMount(() => {
		moment.locale(language);
		months = moment.months();
		days = moment.weekdaysShort();
		if (!range) {
			endDate = undefined;
		}
	});

	function changeMonth(direction: number) {
		currentMonthIndex = currentMonthIndex + direction;
	}

	function checkIfDateIsInBetween(start: any, end: any, value: any) {
		const startValue = new Date(start);
		const endValue = new Date(end);
		const date = new Date(value);

		if (date > startValue && date < endValue) {
			return true;
		}

		return false;
	}

	function addDays(date: Date, days: number) {
		let result = new Date(date);
		result.setDate(result.getDate() + days);
		return iso(result);
	}

	function getNumberOfDays(startDate: Date, endDate: Date) {
		const startTime = new Date(startDate).getTime();
		const endTime = new Date(endDate).getTime();

		return (endTime - startTime) / (1000 * 3600 * 24);
	}

	function selectDate(newValue: Date) {
		currentMonthIndex = new Date(newValue).getMonth();
		currentYear = new Date(newValue).getFullYear();

		if (autoCreateRange) {
			startDate = newValue;
			endDate = new Date(addDays(newValue, rangeDaysAfter));
			dispatch('newRange', { startDate: new Date(startDate), endDate });
			return;
		}

		if (!startDate) {
			startDate = newValue;
		} else if (startDate && !endDate && range) {
			if (new Date(newValue) < new Date(startDate)) {
				if (getNumberOfDays(newValue, startDate) > rangeDaysAfter) {
					return;
				}
				endDate = startDate;
				startDate = newValue;
			} else {
				if (getNumberOfDays(startDate, newValue) > rangeDaysAfter) {
					return;
				}
				endDate = newValue;
			}
		} else {
			startDate = newValue;
			endDate = undefined;
		}

		if (range) {
			dispatch('newRange', {
				startDate: new Date(startDate),
				endDate: endDate ? new Date(endDate) : undefined
			});
		} else {
			dispatch('newDate', startDate);
		}
	}

	$: viewDate = viewDateFrom(startDate, currentMonthIndex, currentYear);

	$: month = months[viewDate.getMonth()];

	$: year = viewDate.getFullYear();

	$: weeks = weeksFrom(viewDate, startDate, endDate, start);

	function viewDateFrom(date: Date | undefined, currentMonthIndex: number, currentYear: number) {
		if (!date) {
			date = new Date();
		}
		var viewDate = new Date(date);

		viewDate.setFullYear(currentYear, currentMonthIndex, 1);

		return viewDate;
	}

	function weeksFrom(
		viewDate: any,
		startDate: Date | undefined,
		endDate: Date | undefined,
		start: number
	) {
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
				value = iso(date);

			week.push({
				date: dd,
				value,
				class: [
					mm == month &&
					((startDate && iso(new Date(startDate)) === value) ||
						(endDate && iso(new Date(endDate)) === value))
						? 'selected'
						: '',
					mm == month ? '' : (mm > month ? yy >= year : yy > year) ? 'future' : 'past',
					range && endDate != undefined
						? checkIfDateIsInBetween(startDate, endDate, value)
							? 'range-selected'
							: ''
						: ''
				].join(' ')
			});

			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

			if (date.getDay() === start) {
				week = [];
				weeks.push(week);
			}
		}

		return weeks;
	}
</script>

<tr class=" header">
	<td
		colspan="5"
		on:click={() => {
			dispatch('setMonthsView');
		}}
		class="subtitle-1 title blue">{month} {year}</td
	>
	<td on:click={() => changeMonth(-1)}><i class="material-icons arrow"> keyboard_arrow_left </i></td
	>
	<td on:click={() => changeMonth(+1)}
		><i class="material-icons arrow"> keyboard_arrow_right </i></td
	>
</tr>
<tr>
	{#each days as day}
		<th class="overline-small border-right remove-border-right border-top">{day}</th>
	{/each}
</tr>
{#each weeks as week, weekIndex}
	<tr>
		{#each week as day, dayIndex}
			<td
				class="btn remove-border-right border-top border-right {day.class} "
				class:border-bottom-left={weekIndex == weeks.length - 2 && dayIndex == 0}
				on:click={() => {
					if (!day.class.includes('future') && !day.class.includes('past')) selectDate(day.value);
				}}><span class="overline-small">{day.date}</span></td
			>
		{/each}
	</tr>
{/each}

<style>
	td {
		width: 36px;
		height: 36px;
		text-align: center;
		margin: 0;
		vertical-align: middle;
		background-color: white;
	}

	td.past,
	td.future,
	td.past:hover,
	td.future:hover {
		background-color: #E7ECEF !important;
		color: #E7ECEF !important;
		cursor: default;
	}

	th {
		font-size: 10px;
		background-color: white;
	}

	td.past > span,
	td.future > span {
		display: none;
	}
	.btn {
		cursor: pointer;
	}
	.btn:hover {
		background: lightgrey;
		color: black;
	}
	td.selected {
		color: white;
		font-weight: bold;
		background-color: #0f7173;
	}

	td.range-selected {
		background-color: #0f7173;
		color: white;
	}
	.header {
		align-items: center;
	}

	.header td:first-child {
		border-top-left-radius: 2px;
	}
	.header td:last-child {
		border-top-right-radius: 10px;
	}
	.border-bottom-left {
		border-bottom-left-radius: 10px;
	}
	.title {
		text-align: left;
		padding-left: 10px;
		padding-bottom: 0px;
		cursor: pointer;
	}

	.border-top,
	.border-right {
		border-top: 1px solid white;
	}

	.remove-border-right:last-child {
		border-right: none;
	}
	.arrow {
		vertical-align: middle;
		cursor: pointer;
		color: #272932;
	}
</style>
