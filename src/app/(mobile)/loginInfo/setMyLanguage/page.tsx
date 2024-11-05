"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchLanguageName } from "@/api/firstSetting/fetchLanguageName";
import caretleft from "@/../public/images/caret-left.svg";
import Image from "next/image";

export default function SetMyLanguage() {
  const [selectedMyLanguage, setSelectedMyLanguage] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();

  // Tanstack Query - 지원언어 데이터 가져오기
  const {
    data: languages,
    error: languagesError,
    isLoading: languagesLoading
  } = useQuery({
    queryKey: ["language"],
    queryFn: () => fetchLanguageName()
  });

  const supportingLanguages = languages?.map((language) => language.language_name);

  // 로딩 상태
  if (languagesLoading) return <p>Loading...</p>;
  // 오류 상태
  if (languagesError) return <p>Error loading user answers: {languagesError.message}</p>;

  const handleContinue = async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;

    if (userId && selectedMyLanguage) {
      const { error } = await supabase.from("user_info").update({ my_language: selectedMyLanguage }).eq("id", userId);

      if (!error) {
        router.push("/loginInfo/setLearnLanguage");
      }
    }
  };

  return (
    <>
      <div className="px-4 py-3 mb-[10px] h-12 flex gap-[6px]">
        <button
          onClick={() => router.back()} // 뒤로 가기 함수 호출
          className="mb-4"
        >
          <Image src={caretleft} alt={"caret-left"} />
        </button>
        <></>
      </div>
      <div className="px-4">
        <div className="mb-6 flex flex-col items-center gap-1">
          <h1 className="text-[var(--Primary-50,#020401)] text-center font-suit text-[28px] font-bold leading-[42px] tracking-[-0.56px]">
            모국어를 선택해 주세요
          </h1>
          <p className="text-[var(--Gray-500,#8C8C8C)] text-center font-pretendard text-[14px] font-medium leading-[21px] tracking-[-0.28px]">
            모국어를 설정해 주세요
          </p>
        </div>
        <div className="w-full flex flex-col items-start gap-2 shrink-0">
          {supportingLanguages?.map((language, index) => (
            <button
              key={index}
              onClick={() => setSelectedMyLanguage(language)}
              className={`"flex h-[64px] py-[10px] px-[20px] text-left gap-[10px] shrink-0 self-stretch rounded-[10px] "
      ${
        selectedMyLanguage === language
          ? "border border-secondary-500 bg-secondary-900"
          : "border border-gray-800 bg-white"
      }`}
            >
              <p>{language}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="relative z-0 bg-[var(--White, #FDFDFD)] py-[10px] px-4">
        <button
          onClick={handleContinue}
          disabled={!selectedMyLanguage}
          className={`flex w-full h-[54px] p-[10px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[10px] mb-[10px] ${
            selectedMyLanguage ? "opacity-100 bg-primary-500" : "opacity-40 bg-primary-500"
          }`}
        >
          계속
        </button>
      </div>
    </>
  );
}
