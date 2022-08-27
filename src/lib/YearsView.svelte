<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let selectedYear = new Date().getFullYear();
	export let selectedMonth: any = null;

	let currentYear = new Date().getFullYear();
	let years: number[] = [];
	let yearsToDisplay: number[] = [];
	let startIndex: number = 0;
	let endIndex: number = 0;
	let range: string = '';
	const dispatch = createEventDispatcher();

	function generateYears() {
		let yearsBefore = new Array(96).fill(0).map((_, idx) => currentYear - 96 + idx);
		let yearsAfter = new Array(96).fill(0).map((_, idx) => currentYear + idx);
		years = [...yearsBefore, ...yearsAfter];
		let yrs: any[] = [];
		let index = 0;

		while (index <= years.length) {
			yrs = years.slice(index, index + 12);
			if (yrs.includes(selectedYear)) {
				break;
			}
			index = index + 12;
		}

		yearsToDisplay = yrs;
		startIndex = index;
		endIndex = startIndex + 12;
		range = `${yearsToDisplay[0]} - ${yearsToDisplay[11]}`;
	}

	onMount(async () => {
		generateYears();
	});

	function changeYear(direction: number) {
		if (startIndex + direction < 0 || endIndex + direction > years.length) {
			return;
		}

		startIndex += direction;
		endIndex += direction;
		yearsToDisplay = years.slice(startIndex, endIndex);

		range = `${yearsToDisplay[0]} - ${yearsToDisplay[11]}`;
	}

	function selectYear(yearIndex: number) {
		if (selectedYear != yearsToDisplay[yearIndex]) {
			selectedMonth = null;
		}
		selectedYear = yearsToDisplay[yearIndex];
		dispatch('newYear', { selectedYear, selectedMonth });
	}
</script>

<tr class="border-bottom header">
	<td colspan="2" class="subtitle-1 title blue">{range}</td>
	<td on:click={() => changeYear(-12)}
		><i class="material-icons arrow" class:disabled={startIndex == 0}> keyboard_arrow_left </i></td
	>
	<td
		on:click={() => {
			changeYear(+12);
		}}
		><i class="material-icons arrow" class:disabled={endIndex == years.length}>
			keyboard_arrow_right
		</i></td
	>
</tr>

{#each { length: 3 } as _, rowIndex}
	<tr>
		{#each { length: 4 } as _, colIndex}
			{@const index = rowIndex * 4 + colIndex}
			<td
				class="border-top btn border-right remove-border-right body-2 {selectedYear ==
				yearsToDisplay[index]
					? 'selected'
					: ''}"
				class:border-bottom-left={rowIndex == 2 && colIndex == 0}
				on:click={() => {
					selectYear(index);
				}}
			>
				{yearsToDisplay[index] || ''}
			</td>
		{/each}
	</tr>
{/each}

<style>
	.header {
		align-items: center;
	}

	.header td:last-child {
		border-top-right-radius: 10px;
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

	.selected {
		background: lightgrey;
		color: black;
	}

	.btn:hover {
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

	.border-bottom-left {
		border-bottom-left-radius: 10px;
	}

	.arrow {
		vertical-align: middle;
		cursor: pointer;
		widows: 36px;
		color: #272932;
	}

	.disabled {
		color: lightgrey;
		cursor: default;
	}
</style>
