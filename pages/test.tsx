import { Calendar } from "@/components/calendar";

import React from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { DatePicker } from "@/components/datepicker";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/form";
import { Select } from "@/components/select";
import { Input } from "@/components/input";
import { ListFilter } from "lucide-react";
import { Popover, PopoverTrigger, Tester } from "@/components/popover";
import { PopoverContent } from "@radix-ui/react-popover";

const options = [
  {
    key: "1",
    label: "apple",
  },
  {
    key: "2",
    label: "orange",
  },
  {
    key: "3",
    label: "strawberry",
  },
  {
    key: "4",
    label: "grape",
  },
  {
    key: "5",
    label: "tomato",
  },
  {
    key: "6",
    label: "kiwi",
  },
];

const Test = () => {
  const formSchema = z.object({
    multiselect: z
      .object({
        key: z.string(),
        label: z.string(),
      })
      .array()
      .min(1, { message: "must select at least one item." }),

    select: z.string().optional(),
    dateRange: z
      .object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
      .superRefine((dates, ctx) => {
        const start = new Date(dates.start!);
        const end = new Date(dates.end!);
        if (start > end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `start date cannot be greater than end.`,
          });
        }
      }),
    dateSingle: z.string().superRefine((date, ctx) => {
      const d = new Date(date).toLocaleString();
      const today = new Date().toLocaleString().split(",")[0].trim();

      if (d < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Date cannot be in the past`,
        });
      }
    }),
    textInput: z.string(),
    numberInput: z.number().nullable(),
  });

  const defaultValues = {
    multiselect: options,
    select: options[0].key,
    dateRange: {
      start: "",
      end: "",
    },
    dateSingle: "",
    textInput: "",
    numberInput: null,
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    alert(JSON.stringify(values));
  };

  const defaultSelected = options.map((item) => item.key);

  return (
    <main className="p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <div className=" gap-4 grid grid-cols-9">
            <FormField
              control={form.control}
              name="multiselect"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <Select
                      size={"small"}
                      label="Multiple Select"
                      description="description"
                      variant={form.formState.errors.multiselect && "error"}
                      placeholder="- Select -"
                      defaultSelectedKeys={defaultSelected}
                      mode="multiple"
                      error={form.formState.errors.multiselect && true}
                      options={options}
                      onSelectionChange={(set) => {
                        const selected = options.filter((option) =>
                          set.has(option.key)
                        );
                        field.onChange(selected);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="select"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <Select
                      placeholder="- Select -"
                      label="Single Select"
                      description="description"
                      defaultSelectedKeys={defaultSelected[0]}
                      size={"small"}
                      mode="single"
                      options={options}
                      onSelectionChange={(set) => {
                        const selected = options.filter((option) =>
                          set.has(option.key)
                        );

                        field.onChange(selected[0]?.label);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <DatePicker
                      size={"small"}
                      label="Date Range"
                      description="description"
                      minValue={today(getLocalTimeZone())}
                      mode="range"
                      error={form.formState.errors.dateRange ? true : false}
                      onChange={(val: any) => {
                        const start = `${val.start.month}/${val.start.day}/${val.start.year}`;
                        const end = `${val.end.month}/${val.end.day}/${val.end.year}`;

                        field.onChange({ start: start, end: end });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateSingle"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <DatePicker
                      size={"small"}
                      label="Date Single"
                      description="description"
                      minValue={today(getLocalTimeZone())}
                      error={form.formState.errors.dateSingle ? true : false}
                      mode="single"
                      onChange={(val: any) => {
                        const date = `${val.month}/${val.day}/${val.year}`;

                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textInput"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <Input
                      label="Text Input"
                      placeholder="placeholder"
                      description="description"
                      size={"small"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberInput"
              render={({ field }) => (
                <FormItem className=" col-span-2">
                  <FormControl>
                    <Input
                      label="Number Input"
                      placeholder="placeholder"
                      description="description"
                      size={"small"}
                      format="number"
                      icon={
                        <ListFilter className=" text-primary cursor-pointer" />
                      }
                      formatOptions={{
                        style: "currency",
                        currency: "USD",
                      }}
                      minValue={0}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Popover>
              <PopoverTrigger>open</PopoverTrigger>
              <PopoverContent className=" border border-coolGray-400 p-4 w-72">
                hello from contetn
              </PopoverContent>
            </Popover>

            <Tester />

            <button type="submit">Submit</button>
          </div>
        </form>
      </Form>
    </main>
  );
};

export default Test;
