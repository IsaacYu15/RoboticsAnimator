package api

import (
	"encoding/json"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
)

func toPgInt4(v *int) pgtype.Int4 {
	if v == nil {
		return pgtype.Int4{}
	}
	return pgtype.Int4{Int32: int32(*v), Valid: true}
}
func toPgText(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}

	return (pgtype.Text{String: strings.TrimSpace(*s), Valid: true})
}

func toPgFloat8(v *float64) pgtype.Float8 {
	if v == nil {
		return pgtype.Float8{}
	}
	return pgtype.Float8{Float64: *v, Valid: true}
}

func toPgJSONB(v *json.RawMessage) []byte {
	if v == nil {
		return nil
	}
	return []byte(*v)
}
