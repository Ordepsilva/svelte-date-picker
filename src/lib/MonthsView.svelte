<script lang="ts">
	import moment from 'moment';
	import { createEventDispatcher, onMount } from 'svelte';

	export let selectedMonth = new Date().getMonth();
	export let selectedYear = new Date().getFullYear();
	export let language: string = 'en';
	let currentYear = new Date().getFullYear();
	let months: string[] = [];
	const dispatch = createEventDispatcher();

	onMount(async () => {
		currentYear = selectedYear;
		moment.locale(language);
		months = moment.monthsShort();
	});
	function changeYear(direction: number) {
		currentYear = currentYear + direction;
		dispatch('newYear', { selectedYear });
	}

	function changeMonth(monthIndex: number) {
		selectedMonth = monthIndex;
		selectedYear = currentYear;
		dispatch('newMonth', { selectedMonth, selectedYear });
	}
</script>

{#if selectedYear}
	<tr class="border-bottom header">
		<td
			colspan="2"
			class="subtitle-1 title blue"
			on:click={() => {
				dispatch('yearsView');
			}}>{currentYear}</td
		>
		<td on:click={() => changeYear(-1)}
			><i class="material-icons arrow"> keyboard_arrow_left </i></td
		>
		<td on:click={() => changeYear(+1)}
			><i class="material-icons arrow"> keyboard_arrow_right </i></td
		>
	</tr>

	{#if months.length > 0}
		{#each { length: 3 } as _, rowIndex}
			<tr>
				{#each { length: 4 } as _, colIndex}
					{@const index = rowIndex * 4 + colIndex}
					<td
						class="border-top btn border-right remove-border-right body-2 {selectedMonth ===
							index && currentYear == selectedYear
							? 'selected'
							: ''}"
						class:border-bottom-left={rowIndex == 2 && colIndex == 0}
						on:click={() => {
							changeMonth(index);
						}}
					>
						{months[index]}
					</td>
				{/each}
			</tr>
		{/each}
	{/if}
{/if}

<style>
	.header {
		align-items: center;
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

	td {
		width: 36px;
		height: 36px;
		text-align: center;
		margin: 0;
		cursor: pointer;
		background-color: white;
	}

	.btn {
		width: 64px;
		height: 64px;
	}

	.btn:hover {
		background: lightgrey;
		color: black;
	}

	.selected {
		background: lightgrey;
		color: black;
	}

	.border-bottom {
		border-bottom: 1px solid #272932 !important;
	}

	.border-top {
		border-top: 1px solid #272932;
	}

	.border-right {
		border-right: 1px solid #272932;
	}

	.remove-border-right:last-child {
		border-right: none;
	}

	.arrow {
		vertical-align: middle;
		cursor: pointer;
		widows: 36px;
		color: #272932;
	}
</style>
