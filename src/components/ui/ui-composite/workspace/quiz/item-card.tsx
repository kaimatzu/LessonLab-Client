'use client'

import { AssessmentItem } from "@/lib/types/assessmentTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui-base/shared/card"
import { Input } from "@/components/ui/ui-base/shared/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/ui-base/shared/radio-group"
import { useState } from "react"
import { LuMoreHorizontal } from "react-icons/lu"

interface ItemCardProps {
  item: AssessmentItem,
  no: number
}

/**
 * Card component for each item in an assessment.
 * @item The assessment item object.
 */
const ItemCard = ({ item, no }: ItemCardProps) => {

  const [selectedChoice, setSelectedChoice] = useState<string>('')
  const [identificationAnswer, setIdentificationAnswer] = useState<string>('')

  // TODO: Make on click funcion on clicking the LuMoreHoirzontal icon
  const handleMore = (e: any) => {
    e.preventDefault()
  }

  return (
    <Card className="border-[#BFBFBF] bg-[#F1F3F8]">
      <CardHeader>
        <CardTitle className="flex justify-between">
          Item {no}
          <LuMoreHorizontal onClick={() => {}} className="cursor-pointer" />
        </CardTitle>
        <div className="p-4">
          {item.question}
        </div>
      </CardHeader>
      <CardContent className="px-12">

        {item.content.type === 'MultipleChoice' ? (
          <RadioGroup onValueChange={setSelectedChoice}>
            {(item.content as unknown as MultipleChoice).choices?.map((choice, index) => (
              <div className="flex gap-2 items-center" key={index}>
                <RadioGroupItem value={choice.content as string} id={index.toString()}/>
                <label htmlFor={index.toString()} className={selectedChoice === choice.content as string ? 'text-primary' : ''}>{choice.content as string}</label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Input value={identificationAnswer} onChange={(e) => { setIdentificationAnswer(e.currentTarget.value) }}/>
        )}

      </CardContent>
    </Card>
  )
}

export default ItemCard