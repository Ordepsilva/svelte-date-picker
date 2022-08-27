<script lang="ts">
	import Picker from '$lib/Picker.svelte';
	import PickerView from '$lib/PickerView.svelte';
	import moment from 'moment';

	let days = {
		coral: []
	};

	let subtitles = [
		{
			color: 'coral',
			label: 'Legend example'
		}
	];

	const getDaysBetweenDates = (startDate, endDate) => {
		days.coral = [];
		let now = startDate.clone();

		while (now.isSameOrBefore(endDate)) {
			days.coral.push(now.toDate());
			now.add(1, 'days');
		}

		days.coral = [...new Set(days.coral.map((r) => r.getTime()))].map((r: number) => new Date(r));
		days.coral.sort((date1, date2) => date1 - date2);
	};

	const handleNewRange = (event: CustomEvent) => {
		const startDate = moment(event.detail.startDate).unix();
		const endDate = event.detail.endDate ? moment(event.detail.endDate).unix() : undefined;

		let start = moment(startDate * 1000);
		let end = moment(endDate * 1000);
		getDaysBetweenDates(start, end);
	};
</script>

<div class="body">
	<div class="pickers">
		<h1>Date picker with range</h1>
		<Picker on:range={(event) => handleNewRange(event)} />
	</div>
	<div class="pickers ">
		<h1>Small calendar view</h1>
		<div class="picker-view">
			<PickerView bind:selectedDates={days} {subtitles} />
		</div>
	</div>
</div>

<style>
	.body {
		display: flex;
		justify-content: center;
		height: 100vh;
		width: 100vw;
	}
	.pickers {
		margin: 20vh 10vh;
	}
	.picker-view {
		width: 250px;
	}
</style>
