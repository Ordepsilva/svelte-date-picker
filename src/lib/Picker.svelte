<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import DaysView, { iso } from './DaysView.svelte';
	import MonthsView from './MonthsView.svelte';
	import YearsView from './YearsView.svelte';

	const dispatch = createEventDispatcher();
	export let range = true;
	export let rangeDaysAfter: number = 999;
	export let startDate: Date | undefined = undefined;
	export let endDate: Date | undefined = undefined;
	export let autoCreateRange = false;
	export let isOpen = false;
	export let invalid = false;
	export let defaultOffSetTop: string = '46px';
	export let errorMessage: string = 'Please choose a date.';
	export let language: string = 'en';

	let monthsView = false,
		daysView = true,
		yearsView = false;
	let offsetTop = '';
	let left = 0;
	let bottom = false;
	let currentMonthIndex: number = new Date().getMonth();
	let currentYear: number = new Date().getFullYear();
	let inputElement: HTMLElement, pickerElement: HTMLElement;

	onMount(async () => {
		if (startDate) {
			currentMonthIndex = new Date(startDate).getMonth();
			currentYear = new Date(startDate).getFullYear();
		}
	});

	function handleNewMonth(event: CustomEvent) {
		currentMonthIndex = event.detail.selectedMonth;
		currentYear = event.detail.selectedYear;
		monthsView = false;
		daysView = true;
	}

	function handleNewYear(event: CustomEvent) {
		currentYear = event.detail.selectedYear;
		currentMonthIndex = event.detail.selectedMonth;
		monthsView = true;
		yearsView = false;
	}

	function toggleOpen() {
		if (isOpen === false) {
			isOpen = true;
		} else {
			isOpen = false;
		}
	}

	function clickOutside(node: any) {
		const handleClick = (event: any) => {
			if (
				node &&
				isOpen &&
				!inputElement.contains(event.target) &&
				!pickerElement.contains(event.target) &&
				!node.contains(event.target) &&
				!event.defaultPrevented
			) {
				node.dispatchEvent(new CustomEvent('click-outside', node));
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function setPositionY(node: any) {
		const containerMaxHeight = 297;
		const viewportHeight = document.body.scrollHeight;
		const offsets = node.getBoundingClientRect();
		const offsetBottom = offsets.bottom;
		const remainingSpaceBottom = viewportHeight - document.documentElement.scrollTop - offsetBottom;

		if (containerMaxHeight < remainingSpaceBottom) {
			offsetTop = defaultOffSetTop;

			bottom = true;
		}
	}

	function getDatePickerHeight(node: any) {
		let computedStyles = window.getComputedStyle(node);
		let elementHeight = parseFloat(computedStyles.height);
		offsetTop = !bottom ? `-${elementHeight + 6}px` : defaultOffSetTop;
	}

	function setPositionX(node: any) {
		const offsets = node.getBoundingClientRect();
		const remainingSpaceRight = window.innerWidth - offsets.right - 5;

		if (remainingSpaceRight < 51) {
			left = -51;
		}
	}

	function observe(node: any) {
		if (node) {
			getDatePickerHeight(node);
			if (!bottom) {
				const observer = new MutationObserver(() => {
					getDatePickerHeight(node);
				});

				const config = { attributes: true, subtree: true, childList: true };

				observer.observe(node, config);
			}
		}
	}

	function handleNewRange(event: CustomEvent) {
		startDate = event.detail.startDate;
		endDate = event.detail.endDate;
		dispatch('range', event.detail);
	}

	function closeDatePicker() {
		isOpen = false;
		if (startDate) {
			currentMonthIndex = new Date(startDate).getMonth();
			currentYear = new Date(startDate).getFullYear();
		}

		yearsView = false;
		daysView = true;
		monthsView = false;
		dispatch('close');
	}
</script>

<div class="wrapper">
	<div
		id="date-wrapper"
		class:isOpen
		class={'date-wrapper-box'}
		bind:this={inputElement}
		use:clickOutside
		use:setPositionX
		use:setPositionY
		on:click-outside={() => {
			closeDatePicker();
		}}
	>
		<slot {startDate} {endDate}
			><div class="date-wrapper" class:isOpen class:invalid on:click={toggleOpen}>
				{#if range}
					<span class="body-2 grey"
						>{`${startDate ? iso(startDate) : 'Start Date'} - ${
							endDate ? iso(endDate) : 'End Date'
						}`}</span
					>
				{:else}
					<span class="body-2 grey"
						>{`${startDate ? iso(startDate) : 'Select Date'} 
        `}</span
					>
				{/if}
				<i class="material-icons grey event-icon">event</i>
			</div>
			{#if invalid}
				<span class="error-message overline">{errorMessage}</span>
			{/if}
		</slot>
	</div>
	{#if isOpen}
		<div
			class="date-picker-wrapper"
			id="date-picker-wrapper"
			use:observe
			bind:this={pickerElement}
			style="top: {offsetTop}; {left ? `left:${left}px` : ''}"
			use:clickOutside
			on:click-outside={() => {
				closeDatePicker();
			}}
		>
			<table class="date-picker-table">
				{#if daysView}
					<DaysView
						{range}
						{startDate}
						{endDate}
						{language}
						{rangeDaysAfter}
						{autoCreateRange}
						bind:currentYear
						bind:currentMonthIndex
						on:setMonthsView={() => {
							monthsView = true;
							daysView = false;
						}}
						on:newDate={(event) => {
							startDate = new Date(event.detail);
							dispatch('newDate', new Date(event.detail));
						}}
						on:newRange={(event) => {
							handleNewRange(event);
						}}
					/>
				{/if}
				{#if monthsView}
					<MonthsView
						selectedMonth={currentMonthIndex}
						selectedYear={currentYear}
						{language}
						on:newMonth={(event) => {
							handleNewMonth(event);
						}}
						on:yearsView={() => {
							monthsView = false;
							yearsView = true;
						}}
						on:newYear={(event) => {
							currentYear = event.detail.selectedYear;
						}}
					/>
				{/if}
				{#if yearsView}
					<YearsView
						selectedYear={currentYear}
						selectedMonth={currentMonthIndex}
						on:newYear={(event) => {
							handleNewYear(event);
						}}
					/>
				{/if}
			</table>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		width: fit-content;
		position: relative;
	}
	.date-wrapper-box {
		width: fit-content;
	}
	.date-wrapper {
		display: flex;
		position: relative;
		justify-content: space-between;
		align-items: center;
		min-width: 200px;
		border: 1px solid #272932;
		border-radius: 2px 10px;
		padding: 8px 10px;
		box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06);
	}

	.date-wrapper:hover,
	.date-wrapper.isOpen {
		border: 1px solid #272932;
		color: white;
		cursor: pointer;
	}

	.date-wrapper:hover span,
	.date-wrapper:hover i,
	.date-wrapper.isOpen span,
	.date-wrapper.isOpen i {
		color: #272932;
	}

	.date-wrapper.invalid {
		border: 1px solid red;
	}
	.date-picker-table {
		box-shadow: 0px 0px 0px 1px #272932;
		border-radius: 2px 10px;
		border-spacing: unset !important;
	}

	.event-icon {
		margin-left: 10px;
	}

	.date-picker-wrapper {
		position: absolute;
		width: max-content;
		z-index: 1005;
	}

	.error-message {
		color: red;
		text-transform: none;
		margin-left: 13px;
	}
</style>
