import { InfiniteSlider } from '@/components/ui/infinite-slider';

export function InfiniteSliderBasic() {
  return (
    <InfiniteSlider gap={24} reverse className="w-full h-full bg-white">
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80"
        alt="Design Asset 1"
        className="h-[100px] w-auto rounded-xl object-cover shadow-sm"
      />
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80"
        alt="Design Asset 2"
        className="h-[100px] w-auto rounded-xl object-cover shadow-sm"
      />
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80"
        alt="Design Asset 3"
        className="h-[100px] w-auto rounded-xl object-cover shadow-sm"
      />
    </InfiniteSlider>
  );
}

export default {
  InfiniteSliderBasic,
};
