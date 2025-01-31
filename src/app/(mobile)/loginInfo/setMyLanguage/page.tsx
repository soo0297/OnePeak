"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchLanguageName } from "@/api/firstSetting/fetchLanguageName";
import caretleft from "@/assets/caret-left.svg";
import check from "@/assets/check.svg";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

  // 언어 이름만 추출
  const supportingLanguages = languages?.map((language) => language.language_name);

  // 로딩 상태
  if (languagesLoading) return <LoadingSpinner />;
  // 오류 상태
  if (languagesError) return console.error(`${languagesError.message}`);

  // 내언어 선택 후 다음 페이지로 이동하는 함수
  const handleContinue = async () => {
    const { data } = await supabase.auth.getSession(); // 현재 로그인 세션 가져오기
    const userId = data?.session?.user?.id; // 사용자 ID 추출

    if (userId && selectedMyLanguage) {
      // 내언어를 Supabase의 "user_info" 테이블에 업데이트
      const { error } = await supabase.from("user_info").update({ my_language: selectedMyLanguage }).eq("id", userId);

      // 업데이트 성공 시 다음 단계로 이동
      if (!error) {
        router.push("/loginInfo/setLearnLanguage");
      }
    }
  };

  return (
    <div className="md:mt-[70px] md:max-w-[480px] md:mx-auto">
      <button onClick={() => router.back()} className="mb-[10px] md:hidden py-[12px]">
        <Image src={caretleft} alt={"caret-left"} />
      </button>
      <div className="md:py-[40px] md:mt-[70px]">
        <div className="mb-6 flex flex-col items-center gap-1">
          <Typography size={28} weight="bold" className="text-primary-50 text-center">
            모국어를 선택해 주세요
          </Typography>
          <Typography size={14} weight="medium" className="text-gray-500 text-center">
            모국어를 설정해 주세요
          </Typography>
        </div>
        <div className="rounded flex flex-wrap justify-center gap-2">
          {supportingLanguages?.map((language, index) => (
            <button
              key={index}
              onClick={() => setSelectedMyLanguage(language)}
              className={`w-full h-[64px] md:h-[48px] px-5 bg-white rounded-[10px] border border-gray-800 flex justify-center items-center gap-2.5 hover:bg-secondary-900 hover:text-secondary-500
              ${
                selectedMyLanguage === language
                  ? "border border-secondary-500 bg-secondary-900"
                  : "border border-gray-800 bg-white"
              } md:px-[15px] md:w-auto`}
            >
              <Typography size={16} weight="bold" className="flex-grow text-wrap">
                {language}
              </Typography>
              {selectedMyLanguage === language && <Image src={check} alt="checkIcon" className="w-6 h-6" />}
            </button>
          ))}
        </div>
      </div>
      <div className="relative z-0 bg-white py-[10px] md:max-w-[323px] md:mx-auto">
        <button
          onClick={handleContinue}
          disabled={!selectedMyLanguage}
          className={`flex w-full h-[54px] p-[10px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[10px] mb-[10px] ${
            selectedMyLanguage ? "opacity-100 bg-primary-500" : "opacity-40 bg-primary-500"
          } md:my-[70px]`}
        >
          계속
        </button>
      </div>
    </div>
  );
}
