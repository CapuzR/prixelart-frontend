import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import { Art } from '../../../../../types/art.types';

export type AllowedEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  | SelectChangeEvent<string>;

const updateArtField = (
    tiles: Art[],
    tile: Art,
    field: keyof Art,
    value: any
): Art[] => {
    return tiles.map((item) => {
        if (item.artId === tile.artId) {
            return { ...item, [field]: value };
        }
        return item;
    });
};

export const locationEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'artLocation', e.target.value);

export const titleEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'title', e.target.value);

export const originalPhotoHeightEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'originalPhotoHeight', e.target.value);

export const originalPhotoWidthEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'originalPhotoWidth', e.target.value);

export const originalPhotoPpiEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'originalPhotoPpi', e.target.value);

export const originalPhotoIsoEdit = (
    tiles: Art[],
    tile: Art,
    e: SelectChangeEvent<number>
): Art[] => updateArtField(tiles, tile, 'originalPhotoIso', e);

export const descriptionEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'description', e.target.value);

export const exclusiveEdit = (
    tiles: Art[],
    tile: Art,
    e: AllowedEvent
): Art[] => updateArtField(tiles, tile, 'exclusive', e.target.value as string);

export const comissionEdit = (
    tiles: Art[],
    tile: Art,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): Art[] => updateArtField(tiles, tile, 'comission', Number(e.target.value));
